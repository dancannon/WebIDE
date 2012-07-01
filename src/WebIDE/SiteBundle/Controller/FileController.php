<?php
namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use WebIDE\SiteBundle\Entity\ProjectVersion;
use WebIDE\SiteBundle\Entity\Project;
use WebIDE\SiteBundle\Entity\OwnableEntity;
use Symfony\Component\HttpKernel\Exception\HttpException;
use WebIDE\SiteBundle\Entity\File;
use FOS\RestBundle\View\View;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class FileController extends Controller
{
    public function getFilesAction()
    {
        $em = $this->getDoctrine();
        $files = $em->getRepository("WebIDESiteBundle:File")->findAll();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($files);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function getFileAction($id)
    {
        $em = $this->getDoctrine();
        $file = $em->getRepository("WebIDESiteBundle:File")->find($id);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function postFilesAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();

        $file = new File();

        //Find project
        $projectRData = $request->get('project');
        $projectId = is_array($projectRData) ? $projectRData['id'] : $projectRData;

        try {
            $version = $this->getDoctrine()->getRepository('WebIDESiteBundle:ProjectVersion')->findVersionByProject($projectId);
            $project = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProject($projectId, $version);
            $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());
        } catch (\Doctrine\Orm\NonUniqueResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        } catch (\Doctrine\Orm\NoResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        }

        $this->checkPermission($project);

        $file = $this->bindFileData($file, $project, $version, $request->request->all());

        $validator = $this->get('validator');
        $errors = $validator->validate($file);

        if (count($errors) > 0) {
            throw new HttpException(400, "Invalid Request");
        }

        $em->persist($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function putFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();

        $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->findOneBy(array('id' => $id));
        if (!$file) {
            throw $this->createNotFoundException('File not found.');
        }

        //Find project
        $projectId = is_object($request->get('project')) ? $request->get('project')->id : $request->get('project');
        try {
            $version = $this->getDoctrine()->getRepository('WebIDESiteBundle:ProjectVersion')->findVersionByProject($projectId);
            $project = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProject($projectId, $version);
            $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());
        } catch (\Doctrine\Orm\NonUniqueResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        } catch (\Doctrine\Orm\NoResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        }
        $this->checkPermission($project);
        $this->checkPermission($file);

        $file = $this->bindFileData($file, $project, $version, $request->request->all());

        $validator = $this->get('validator');
        $errors = $validator->validate($file);

        if (count($errors) > 0) {
            throw new HttpException(400, "Invalid Request");
        }


        $em->persist($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function deleteFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();

        $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->findOneBy(array('id' => $id));

        if (!$file) {
            throw $this->createNotFoundException('File not found.');
        }

        $this->checkPermission($file);

        $em->remove($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData(array());

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    protected function checkPermission(OwnableEntity $entity=null)
    {
        if($entity !== null) {
            if(!$this->get('security.context')->isGranted('ROLE_USER')) {
                throw new HttpException(401, "Unauthorized");
            }
            if($this->get('security.context')->getToken()->getUser() !== $entity->getUser()) {
                throw new HttpException(403, "Unauthorized");
            }

            return true;
        } else {
            if(!$this->get('security.context')->isGranted('ROLE_USER')) {
                throw new HttpException(401, "Unauthorized");
            }

            return true;
        }
    }

    protected function bindFileData(File $file, Project $project, ProjectVersion $version, array $data)
    {
        $file->setActive(array_key_exists('active', $data) ? !!$data['active'] : false);
        $file->setSelected(array_key_exists('selected', $data) ? !!$data['selected'] : false);
        $file->setResource(array_key_exists('resource', $data) ? $data['resource'] : "");
        $file->setOrder(array_key_exists('order', $data) ? $data['order'] : 1);
        $file->setType(array_key_exists('type', $data) ? $data['type'] : "html");
        $file->setName(array_key_exists('name', $data) ? $data['name'] : "");
        $file->setContent(array_key_exists('content', $data) ? $data['content'] : "");
        $file->setVersion($version);
        $file->setProject($project);
        $file->setUser($this->get('security.context')->getToken()->getUser());

        return $file;
    }
}